import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function BackButton() {
  const navigate = useNavigate();

  function handleBack() {
    navigate("/");
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="
        group
        inline-flex
        items-center
        gap-3
        rounded-full
        border
        border-[#DCC6E8]
        bg-[#F8F2FB]
        px-5
        py-3
        text-sm
        font-bold
        text-[#8C6AA7]
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-[#C5A5D8]
        hover:bg-[#F0E5F5]
        hover:shadow-md
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[#8C6AA7]
      "
    >
      <ArrowLeft
        size={17}
        className="
          transition-transform
          duration-300
          group-hover:-translate-x-1
        "
      />

      <span>Back to Home</span>

      <Home
        size={15}
        className="opacity-70"
      />
    </button>
  );
}