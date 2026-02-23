import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Coffee, Heart, Star, Lightbulb, Users, Target, Home, GraduationCap, ArrowLeftRight } from 'lucide-react';

const PANELS = ['cafe.js', 'terminal', 'semester.js'];

const About = () => {
  const [panelIdx, setPanelIdx] = useState(0);
  const navigate = useNavigate();
  const cyclePanel = () => setPanelIdx(prev => (prev + 1) % PANELS.length);

  const features = [
    { icon: Lightbulb, text: "Late-night epiphanies happen" },
    { icon: Users, text: "Friendships form over shared struggles" },
    { icon: Target, text: "Deadlines meet their match" },
    { icon: Home, text: "First-years discover their second home" },
    { icon: GraduationCap, text: "Final-years reminisce before leaving" },
    { icon: Coffee, text: "Everyone finds common ground: good coffee" }
  ];

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3E2723] mb-3">
            About Us
          </h2>
          <p className="font-mono text-[#5D4037] text-sm md:text-base">
            // Core Architecture &amp; Mission Statement
          </p>
        </div>

        {/* Top Row: Toggling Code Block + Stats */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-20 items-stretch">

          {/* Left: Toggling Code Block */}
          <div className="bg-[#1a1a1a] rounded-xl shadow-2xl flex flex-col h-full min-h-[300px] overflow-hidden">
            {/* Title bar with mac dots + swap button */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                <span className="ml-2 text-gray-500 text-xs font-mono self-center">
                  {PANELS[panelIdx]}
                </span>
              </div>
              {/* Swap button */}
              <button
                onClick={cyclePanel}
                title="Switch view"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/40 text-gray-400 hover:text-[#D4AF37] transition-all duration-300 text-xs font-mono"
              >
                <ArrowLeftRight size={13} />
                <span>{PANELS[(panelIdx + 1) % PANELS.length]}</span>
              </button>
            </div>

            {/* Content */}
            <div className="h-[280px] p-6 md:p-8 font-mono text-xs md:text-sm flex flex-col justify-center overflow-hidden">
              {panelIdx === 0 && (
                /* cafeMagic() JS block */
                <div className="space-y-1 leading-relaxed">
                  <div className="text-gray-500">/*</div>
                  <div className="text-gray-400 pl-4">* Welcome to Nescafe Bangaram</div>
                  <div className="text-gray-400 pl-4">* Mission: Keep the campus awake, inspired, and connected</div>
                  <div className="text-gray-500">*/</div>
                  <div className="text-blue-400">function <span className="text-[#dcdcaa]">cafeMagic</span>() {'{'}</div>
                  <div className="pl-6 text-[#9cdcfe]">
                    <span className="text-[#c586c0]">if</span> (stressed) <span className="text-[#c586c0]">return</span> coffee;
                  </div>
                  <div className="pl-6 text-[#9cdcfe]">
                    <span className="text-[#c586c0]">if</span> (celebrating) <span className="text-[#c586c0]">return</span> coffee;
                  </div>
                  <div className="pl-6 text-[#9cdcfe]">
                    <span className="text-[#c586c0]">if</span> (deadline) <span className="text-[#c586c0]">return</span> <span className="text-[#ce9178]">LOTS_OF_COFFEE</span>;
                  </div>
                  <div className="pl-6 text-[#9cdcfe]">
                    <span className="text-[#c586c0]">if</span> (justBecause) <span className="text-[#c586c0]">return</span> coffee; <span className="text-[#6a9955]">// Best reason</span>
                  </div>
                  <div className="text-blue-400">{'}'}</div>
                </div>
              )}

              {panelIdx === 1 && (
                /* sudo apt-get terminal block */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-[#D4AF37] font-bold">$</span>
                    <span className="text-green-400">sudo</span>
                    <span className="text-white">apt-get install coffee</span>
                    <span className="w-2 h-4 bg-white/70 animate-pulse inline-block ml-1 align-middle" />
                  </div>
                  <div className="text-gray-500 pl-4 text-xs md:text-sm leading-relaxed space-y-1 pt-1">
                    <div>Reading package lists... <span className="text-green-400">Done</span></div>
                    <div>Building dependency tree... <span className="text-green-400">Done</span></div>
                    <div>The following packages will be installed:</div>
                    <div className="pl-4 text-[#D4AF37]">nescafe-bangaram espresso good-vibes</div>
                    <div className="pt-1">Do you want to continue? [Y/n] <span className="text-green-400">Y</span></div>
                    <div className="pt-1">Setting up <span className="text-[#D4AF37]">nescafe-bangaram</span>...</div>
                    <div className="text-green-400 font-bold pt-1">☕ Coffee installed successfully.</div>
                  </div>
                </div>
              )}

              {panelIdx === 2 && (
                /* semesterSurvival block */
                <div className="space-y-1 leading-relaxed">
                  <div className="text-gray-500">{'/*'}</div>
                  <div className="text-gray-400 pl-4">* NECafé Academic Engine</div>
                  <div className="text-gray-400 pl-4">* Credits: 3 (Coffee Lab)</div>
                  <div className="text-gray-500">{'*/'}</div>
                  <div className="mt-1">
                    <span className="text-[#c586c0]">const</span>{' '}
                    <span className="text-[#9cdcfe]">semesterSurvival</span>{' = {'}
                  </div>
                  <div className="pl-6 text-[#ce9178]">"MA101"<span className="text-gray-400">: </span><span className="text-green-400">"integrate(coffee)"</span><span className="text-gray-500">,</span></div>
                  <div className="pl-6 text-[#ce9178]">"CS201"<span className="text-gray-400">: </span><span className="text-green-400">"compile(espresso)"</span><span className="text-gray-500">,</span></div>
                  <div className="pl-6 text-[#ce9178]">"EE205"<span className="text-gray-400">: </span><span className="text-green-400">"charge(double_shot)"</span><span className="text-gray-500">,</span></div>
                  <div className="pl-6 text-[#ce9178]">"HS102"<span className="text-gray-400">: </span><span className="text-green-400">"debate(over_latte)"</span><span className="text-gray-500">,</span></div>
                  <div className="pl-6 text-[#ce9178]">
                    "bonus_credits"<span className="text-gray-400">: </span>
                    <button
                      onClick={() => { navigate('/fun-facts'); window.scrollTo(0, 0); }}
                      className="text-[#D4AF37] underline underline-offset-2 hover:text-yellow-300 transition-colors cursor-pointer"
                    >
                      "/fun-facts"
                    </button>
                    <span className="text-[#6a9955] ml-2">{'// Hidden elective 👀'}</span>
                  </div>
                  <div className="text-white">{'}'};</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 h-full">
            <StatCard
              code="while(true) { cupsServed++; }"
              value="200+"
              label="Cups Served"
              icon={Coffee}
            />
            <StatCard
              code="Community.size = GROWING"
              value="100+"
              label="Happy Regulars"
              icon={Heart}
            />
            <StatCard
              code="Rating.average = 4.9"
              value="4.9/5"
              label="Stars"
              icon={Star}
            />
            <StatCard
              code="Smiles.generated = ∞"
              value="Happiness"
              subValue="Guaranteed"
              label=""
              icon={Zap}
              isSpecial
            />
          </div>
        </div>

        {/* Bottom Row: Text Content (full width) */}
        <div className="max-w-3xl">
          <div className="mb-10">
            <h3 className="font-serif text-3xl md:text-4xl text-[#3E2723] font-bold leading-tight mb-4">
              Born in the <span className="text-[#E53935]">Heart</span> of <span className="text-[#D4AF37]">Campus</span>
            </h3>
            <p className="font-sans text-lg text-[#5D4037] leading-relaxed font-medium">
              We're more than just a café. We're the place where:
            </p>
          </div>

          <ul className="grid sm:grid-cols-2 gap-5 mb-10">
            {features.map((item, i) => (
              <li key={i} className="flex items-center gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#FFF8E1] border border-[#D4AF37]/20 flex items-center justify-center text-[#5D4037] group-hover:bg-[#E53935] group-hover:text-white transition-colors duration-300">
                  <item.icon size={22} strokeWidth={2} />
                </div>
                <span className="font-sans text-lg text-[#3E2723] font-medium">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 inline-block bg-[#3E2723] rounded-xl px-5 py-3 border border-gray-100/10 shadow-xl group hover:border-[#E53935]/40 transition-all duration-300">
            <code className="font-mono text-xs sm:text-sm leading-relaxed">
              <span className="text-[#E53935] mr-2 font-bold">$</span>
              <span className="text-[#D4AF37]">git commit</span>
              <span className="text-gray-300 mx-1.5">-m</span>
              <span className="text-green-400">"No hierarchy. No judgement. Just coffee."</span>
              <span className="ml-1 w-2 h-4 bg-[#E53935]/50 animate-pulse inline-block align-middle" />
            </code>
          </div>
        </div>

      </div>
    </section>
  );
};

const StatCard = ({ code, value, subValue, label, icon: Icon, isSpecial }) => (
  <div className="bg-[#FFF8E1] p-4 md:p-6 rounded-2xl border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-full min-h-[140px] md:min-h-[160px]">
    <div className="font-mono text-[9px] md:text-[10px] text-[#8D6E63] bg-[#D4AF37]/10 p-1.5 rounded self-start mb-3 md:mb-4 break-all">
      {code}
    </div>

    <div className="flex items-end justify-between">
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-1">
          <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm text-[#D4AF37] self-start">
            <Icon size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
          </div>
          {isSpecial ? (
            <div className="flex flex-col leading-none">
              <span className="text-lg md:text-xl font-bold text-[#3E2723]">{value}</span>
              <span className="text-lg md:text-xl font-bold text-[#3E2723]">{subValue}</span>
            </div>
          ) : (
            <span className="text-2xl md:text-3xl font-bold text-[#3E2723]">{value}</span>
          )}
        </div>
        {label && <div className="text-xs md:text-sm font-bold text-[#5D4037] pl-1">{label}</div>}
      </div>
    </div>
  </div>
);

export default About;
