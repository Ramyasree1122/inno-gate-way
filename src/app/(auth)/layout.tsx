import SvgIcon from '@/components/svgIcons';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Pane - Branding */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-center items-center relative overflow-hidden text-white p-12 bg-cover bg-center"
        style={{ backgroundImage: "url('/Login Image.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="z-10 text-center max-w-md flex flex-col items-center space-y-6">
          <div className="mb-4">
            {/* Custom Atom icon approximation */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <SvgIcon type="ai-icon" className="w-24 h-24" />
            </div>
          </div>
          <h1 className="text-4xl font-light whitespace-nowrap">
            Welcome to <span className="font-bold ml-2">InnoAIGateway.</span>
          </h1>
          <p className="flex justify-center items-center text-sm text-white/80 leading-relaxed font-normal text-violet-200">
            One platform for all your AI tools with secure access, token
            optimization, and seamless collaboration.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
