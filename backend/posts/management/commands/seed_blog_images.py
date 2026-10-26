
import json
import mimetypes
import urllib.parse
import urllib.request
from pathlib import Path

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError

from posts.models import Post


BLOG_IMAGES = [
    {
        "title": "The Art of Slow Living: Finding Joy in Everyday Moments",
        "search": "coffee book morning",
        "filename": "slow_living",
    },
    {
        "title": "The Future of Artificial Intelligence in Everyday Life",
        "search": "artificial intelligence computer",
        "filename": "artificial_intelligence",
    },
    {
        "title": "Hidden Gems of Kerala: Places Worth Exploring",
        "search": "Kerala backwaters landscape",
        "filename": "kerala_travel",
    },
    {
    "title": "Small Habits That Can Change Your Life",
    "search": "notebook",
    "filename": "personal_growth",
},
    {
        "title": "A Cozy Weekend Breakfast: Simple Recipes to Try",
        "search": "pancakes breakfast",
        "filename": "weekend_breakfast",
    },
    {
        "title": "Finding Inspiration: How to Stay Creative Every Day",
        "search": "colored pencils sketchbook",
        "filename": "creativity",
    },
]


class Command(BaseCommand):
    help = "Download and attach cover images to the six sample blogs."

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            default="theertha",
            help="Username of the blog author.",
        )

    def get_commons_image(self, search_term):
        api_url = "https://commons.wikimedia.org/w/api.php"

        params = {
            "action": "query",
            "generator": "search",
            "gsrsearch": f"filetype:bitmap {search_term}",
            "gsrnamespace": 6,
            "gsrlimit": 10,
            "prop": "imageinfo",
            "iiprop": "url|mime|size",
            "iiurlwidth": 1200,
            "format": "json",
        }

        url = api_url + "?" + urllib.parse.urlencode(params)

        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": (
                    "MyBlogSampleSeeder/1.0 "
                    "(educational Django project)"
                )
            },
        )

        with urllib.request.urlopen(request, timeout=25) as response:
            data = json.load(response)

        pages = data.get("query", {}).get("pages", {})

        for page in pages.values():
            info_list = page.get("imageinfo", [])

            if not info_list:
                continue

            info = info_list[0]
            mime = info.get("mime", "")

            if mime not in ("image/jpeg", "image/png", "image/webp"):
                continue

            image_url = info.get("thumburl") or info.get("url")

            if image_url:
                return image_url, mime

        return None, None

    def download_image(self, url):
        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": (
                    "MyBlogSampleSeeder/1.0 "
                    "(educational Django project)"
                )
            },
        )

        with urllib.request.urlopen(request, timeout=30) as response:
            content_type = response.headers.get_content_type()

            if content_type not in (
                "image/jpeg",
                "image/png",
                "image/webp",
            ):
                raise ValueError("Downloaded file is not an image.")

            image_data = response.read(8 * 1024 * 1024 + 1)

            if len(image_data) > 8 * 1024 * 1024:
                raise ValueError("Image exceeds the 8 MB limit.")

            return image_data

    def handle(self, *args, **options):
        username = options["username"]

        created = 0
        skipped = 0
        failed = 0

        for item in BLOG_IMAGES:
            try:
                post = Post.objects.get(
                    title=item["title"],
                    author__username=username,
                )

            except Post.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f"Post not found: {item['title']}"
                    )
                )
                failed += 1
                continue

            except Post.MultipleObjectsReturned:
                self.stdout.write(
                    self.style.WARNING(
                        f"Multiple posts found: {item['title']}"
                    )
                )
                failed += 1
                continue

            if post.image:
                self.stdout.write(
                    f"Image already exists: {post.title}"
                )
                skipped += 1
                continue

            try:
                image_url, mime = self.get_commons_image(
                    item["search"]
                )

                if not image_url:
                    raise ValueError(
                        "No suitable Wikimedia Commons image found."
                    )

                image_data = self.download_image(image_url)

                extension = mimetypes.guess_extension(mime)

                if mime == "image/jpeg":
                    extension = ".jpg"

                if not extension:
                    extension = Path(
                        urllib.parse.urlparse(image_url).path
                    ).suffix or ".jpg"

                filename = item["filename"] + extension

                post.image.save(
                    filename,
                    ContentFile(image_data),
                    save=True,
                )

                created += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Image added: {post.title}"
                    )
                )

            except Exception as error:
                failed += 1
                self.stdout.write(
                    self.style.ERROR(
                        f"Failed: {post.title} - {error}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                "\nImage update completed!"
                f"\nAdded: {created}"
                f"\nSkipped: {skipped}"
                f"\nFailed: {failed}"
            )
        )
