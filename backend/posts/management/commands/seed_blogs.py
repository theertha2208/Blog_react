
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.db import transaction

from posts.models import Category, Post


SAMPLE_BLOGS = [
    {
        "category": "Lifestyle",
        "title": "The Art of Slow Living: Finding Joy in Everyday Moments",
        "description": "Discover mindful routines and the beauty of slowing down.",
        "content": """
Life moves quickly. Between responsibilities, notifications, and endless to-do lists, we often forget to appreciate the little things happening around us.

Slow living is about making intentional choices. It encourages us to focus on what matters instead of constantly rushing toward the next achievement.

## Begin Your Morning Gently

Try starting your morning without immediately reaching for your phone. Open the curtains, enjoy the sunlight, prepare a warm drink, and give yourself a few quiet minutes.

These small rituals can create a calmer beginning to your day.

## Appreciate Ordinary Moments

A walk outside, a conversation with a friend, or a favorite song can become meaningful when we give it our full attention.

You do not need an extraordinary life to experience extraordinary moments.

## Create Space for Yourself

Set aside time for hobbies, reading, journaling, or simply resting. Productivity is important, but so is having time to recharge.

## Final Thoughts

Slow living does not mean doing everything slowly. It means choosing where to place your time and energy.

Sometimes, happiness is already present in the moments we overlook.
""",
    },
    {
        "category": "Technology",
        "title": "The Future of Artificial Intelligence in Everyday Life",
        "description": "Explore how AI is changing learning, work, and creativity.",
        "content": """
Artificial intelligence is becoming part of everyday life. From recommendation systems to smart assistants, AI technologies are changing how we interact with digital products.

## AI in Education

Students can use AI-powered tools to explore difficult concepts, practice programming, and receive personalized explanations.

Teachers can also use these tools to prepare learning materials and support different learning styles.

## AI in the Workplace

Businesses are using AI to automate repetitive tasks, analyze information, and improve customer experiences.

This creates opportunities for employees to spend more time on creative and strategic work.

## AI and Creativity

AI-assisted tools can help people brainstorm ideas, experiment with visual designs, and improve their writing.

However, human creativity, judgment, and originality remain essential.

## Responsible AI

As AI becomes more widespread, privacy, fairness, accuracy, and transparency become increasingly important.

Users should verify important information rather than relying on AI outputs without review.

## Looking Ahead

The future of AI is not simply about replacing manual tasks. It is about developing tools that help people learn, create, and solve problems more effectively.
""",
    },
    {
        "category": "Travel",
        "title": "Hidden Gems of Kerala: Places Worth Exploring",
        "description": "Explore peaceful destinations beyond the usual tourist spots.",
        "content": """
Kerala is known for its backwaters, beaches, forests, and beautiful hill stations. Beyond the famous destinations, the state offers many quieter places worth exploring.

## Muzhappilangad Drive-in Beach

Located in Kannur district, Muzhappilangad is famous for its long stretch of beach where driving is permitted in designated conditions.

It is an enjoyable destination for photography, sunset views, and relaxing by the sea.

## Ranipuram

Ranipuram, in Kasaragod district, offers green hills, trekking opportunities, and refreshing mountain scenery.

Visitors who enjoy nature and outdoor activities may find it especially appealing.

## Kumbalangi

Near Kochi, Kumbalangi is known for its village atmosphere, fishing traditions, and peaceful backwater surroundings.

It offers visitors an opportunity to experience a different side of Kerala.

## Thenmala

Thenmala, in Kollam district, is surrounded by forests and natural landscapes. It is a destination for travelers interested in nature-based activities.

## Travel Responsibly

Respect local communities, avoid littering, and follow safety instructions when visiting beaches, forests, and trekking routes.

## Final Thoughts

Some of the most memorable journeys happen when we explore places beyond the usual tourist itinerary.

Kerala has countless beautiful corners waiting to be discovered.
""",
    },
    {
        "category": "Personal Growth",
        "title": "Small Habits That Can Change Your Life",
        "description": "Simple daily practices for a more balanced life.",
        "content": """
Personal growth does not always require dramatic changes. Small, consistent habits can make a meaningful difference over time.

## Start With One Goal

Instead of trying to change everything at once, choose one habit that you can realistically maintain.

For example, begin by reading for ten minutes each day.

## Write Down Your Thoughts

Journaling can help you organize your ideas, reflect on your experiences, and identify what matters to you.

You do not need to write pages. A few honest sentences can be enough.

## Keep Learning

Learning something new keeps life interesting.

You might practice a programming language, improve your communication skills, or explore a creative hobby.

## Take Regular Breaks

Rest is an important part of maintaining focus.

Short breaks during study or work can help you return to your tasks with renewed attention.

## Celebrate Small Wins

Progress is not always immediately visible.

Completing a small task, maintaining a routine, or learning from a mistake is still an achievement.

## Final Thoughts

Consistency matters more than perfection.

Choose habits that fit your lifestyle, remain patient, and give yourself time to grow.
""",
    },
    {
        "category": "Food & Recipes",
        "title": "A Cozy Weekend Breakfast: Simple Recipes to Try",
        "description": "Delicious breakfast ideas for a relaxing weekend morning.",
        "content": """
Weekend mornings are a wonderful opportunity to slow down and enjoy a homemade breakfast.

You do not need complicated ingredients to prepare something delicious.

## Fluffy Homemade Pancakes

Ingredients:

- 1 cup all-purpose flour
- 1 tablespoon sugar
- 1 teaspoon baking powder
- 1 egg
- 3/4 cup milk
- 1 tablespoon melted butter

Instructions:

1. Combine the dry ingredients in a bowl.
2. Whisk the egg, milk, and melted butter separately.
3. Mix the wet and dry ingredients until just combined.
4. Pour small portions onto a lightly greased pan.
5. Cook on both sides until golden and cooked through.

Serve with fruit, honey, or your favorite topping.

## Fresh Fruit Bowl

Combine sliced bananas, apples, berries, or other seasonal fruits.

Add yogurt and a small sprinkle of nuts or seeds for extra texture.

## Simple Vegetable Toast

Toast slices of bread and top them with cooked vegetables, a little seasoning, and cheese if desired.

This makes a quick savory option.

## Make Breakfast Special

Set the table, play relaxing music, and enjoy your meal without rushing.

## Final Thoughts

A cozy breakfast is not just about the food. It is also about creating a pleasant start to your day.
""",
    },
    {
        "category": "Creativity",
        "title": "Finding Inspiration: How to Stay Creative Every Day",
        "description": "Discover ways to find ideas and overcome creative blocks.",
        "content": """
Creativity is not limited to artists and writers. It plays a role in programming, problem-solving, communication, and everyday decisions.

Everyone can develop creative habits.

## Notice Your Surroundings

Inspiration can come from conversations, books, nature, music, and ordinary daily experiences.

Pay attention to details that interest you.

## Keep an Idea Journal

Write down interesting thoughts whenever they appear.

Not every idea needs to become a finished project. Sometimes one small observation leads to something bigger.

## Try Something Different

Experiment with a new hobby, explore a different genre of music, or learn a skill outside your usual interests.

New experiences can introduce fresh perspectives.

## Make Time to Create

Set aside a short period each week for a creative activity.

You might write a blog post, design a webpage, take photographs, or work on a personal project.

## Accept Imperfection

Creative work rarely starts perfectly.

Allow yourself to experiment, make mistakes, and improve gradually.

## Final Thoughts

Creativity grows through curiosity and practice.

The more opportunities you give yourself to explore ideas, the easier it becomes to recognize inspiration in everyday life.
""",
    },
]


class Command(BaseCommand):
    help = "Automatically create six sample blogs for MyBlog."

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            type=str,
            required=True,
            help="Username of an existing MyBlog user.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()
        username = options["username"]

        try:
            author = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(
                f"User '{username}' does not exist."
            )

        created_count = 0
        skipped_count = 0

        for item in SAMPLE_BLOGS:
            category, _ = Category.objects.get_or_create(
                name=item["category"],
                defaults={
                    "description": item["description"]
                },
            )

            exists = Post.objects.filter(
                title=item["title"],
                author=author,
            ).exists()

            if exists:
                skipped_count += 1
                self.stdout.write(
                    f"Already exists: {item['title']}"
                )
                continue

            Post.objects.create(
                title=item["title"],
                content=item["content"].strip(),
                author=author,
                category=category,
                is_published=True,
                approval_status=Post.APPROVAL_APPROVED,
                rejection_reason="",
            )

            created_count += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"Created: {item['title']}"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nCompleted! Created {created_count} "
                f"blogs and skipped {skipped_count} existing blogs."
            )
        )
