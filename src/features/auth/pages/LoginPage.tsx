import { LoginForm } from "../components/LoginForm";
import bgImage from "@/assets/login_background.png";

export default function LoginPage() {
  return (
    <div 
      className="min-h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative font-['Inter',sans-serif]"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Dark overlay for better contrast and teal/blue tones */}
      <div className="absolute inset-0 bg-[#022129]/40 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-[420px] p-6">
        <LoginForm />
      </div>
    </div>
  );
}
