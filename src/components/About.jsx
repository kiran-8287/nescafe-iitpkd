import React from 'react';
import { stats } from '../data/mock';
import { Award, Coffee, Users } from 'lucide-react';

const CountUp = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      const currentCount = Math.floor(end * percentage);
      setCount(currentCount);

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure exact end value
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{count}{suffix}</>;
};

const About = () => {
  const statsData = [
    {
      icon: Coffee,
      value: 200,
      label: 'Cups Served',
      suffix: '+',
      code: 'while(true) { cupsServed++; }'
    },
    {
      icon: Users,
      value: 100,
      label: 'Happy Regulars',
      suffix: '+',
      code: 'Community.size = GROWING'
    },
    {
      icon: Award,
      value: 4.9,
      label: 'Stars',
      suffix: '/5',
      code: 'Rating.average = 4.9',
      isDecimal: true
    },
    {
      icon: Award,
      isTextOnly: true,
      textValue: 'Happiness Guaranteed',
      label: '',
      code: 'Smiles.generated = ∞'
    }
  ];

  return (
    <section id="about" className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-[#3E2723] mb-4">
            System Overclocked
          </h2>
          <p className="text-base md:text-lg text-[#5D4037] max-w-2xl mx-auto font-mono">
            // Core Architecture & Mission Statement
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            {/* Code Block */}
            <div className="bg-[#1e1e1e] rounded-lg p-4 md:p-6 shadow-xl border border-gray-700 font-mono text-xs md:text-base overflow-x-auto">
              <pre className="text-gray-300">
                <code>
                  <span className="text-gray-500">/* </span>{'\n'}
                  <span className="text-gray-500"> * Welcome to Nescafe-Bangaram</span>{'\n'}
                  <span className="text-gray-500"> * Established: 2025</span>{'\n'}
                  <span className="text-gray-500"> * Mission: Keep the campus awake, inspired, and connected</span>{'\n'}
                  <span className="text-gray-500"> * </span>{'\n'}
                  <span className="text-[#569cd6]">function</span> <span className="text-[#dcdcaa]">cafeMagic</span>() {'{'}{'\n'}
                  {'  '}<span className="text-[#c586c0]">if</span> (stressed) <span className="text-[#c586c0]">return</span> coffee;{'\n'}
                  {'  '}<span className="text-[#c586c0]">if</span> (celebrating) <span className="text-[#c586c0]">return</span> coffee;{'\n'}
                  {'  '}<span className="text-[#c586c0]">if</span> (deadline) <span className="text-[#c586c0]">return</span> LOTS_OF_COFFEE;{'\n'}
                  {'  '}<span className="text-[#c586c0]">if</span> (justBecause) <span className="text-[#c586c0]">return</span> coffee; <span className="text-[#6a9955]">// Best reason</span>{'\n'}
                  {'}'}{'\n'}
                  <span className="text-gray-500"> */</span>
                </code>
              </pre>
            </div>

            {/* About Text */}
            <div className="prose prose-lg text-[#5D4037]">
              <p className="font-medium text-xl border-l-4 border-[#D4AF37] pl-4 italic">
                "Born in the heart of IITPKD, we're more than a café - we're where:
              </p>
              <ul className="list-none space-y-2 mt-4 ml-2">
                {['Late-night epiphanies happen', 'Friendships form over shared struggles', 'Deadlines meet their match', 'First-years discover their second home', 'Final-years reminisce before leaving', 'Everyone finds common ground: good coffee'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-[#D4AF37]">✨</span> {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-semibold text-[#3E2723]">
                No hierarchy. No judgement. Just coffee, community, and conversation.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {statsData.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="bg-[#FFF8E1] p-6 rounded-xl border-l-4 border-[#D4AF37] hover:shadow-lg transition-shadow">
                    <div className="font-mono text-xs text-[#8D6E63] mb-2 bg-[#efebe9] p-1 rounded inline-block">
                      {stat.code}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="bg-white p-3 rounded-full shadow-sm">
                        <IconComponent className="h-6 w-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <div className={`font-bold text-[#3E2723] ${stat.isTextOnly ? 'text-lg leading-tight' : 'text-3xl'}`}>
                          {stat.isTextOnly ? stat.textValue : (
                            stat.isDecimal ? stat.value : <CountUp end={stat.value} suffix={stat.suffix} />
                          )}
                          {!stat.isTextOnly && stat.isDecimal && stat.suffix}
                        </div>
                        <div className="text-sm font-semibold text-[#5D4037]">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Featured Image - Keeping one good one for layout balance */}
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000"
                alt="Programming and Coffee"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <p className="text-white font-mono text-lg">
                  <span className="text-[#D4AF37]">&gt;</span> sudo apt-get install coffee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
