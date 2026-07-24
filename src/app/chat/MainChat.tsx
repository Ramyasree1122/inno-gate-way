import SvgIcon from "@/components/svgIcons";
import ChatInput from "./ChatInput";
import {  usePathname } from "next/navigation";

export default function MainChat() {
    const pathname = usePathname();

    return (
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden justify-center items-center bg-white">
        {pathname === "/chat" && (
          <>
            <SvgIcon type="radium-ai-icon" width={53} height={60} />
             <h1 className="text-2xl font-normal text-black">
              <span className="text-gray-500 font-light">Welcome to</span>{" "}
              <span className="font-semibold">InnoAIGateway</span>
            </h1>
          </>
        )}
        <ChatInput />
      </main>
    );
}