const SKILLS = [
  'UX Research', 'UI Design', 'Figma', 'Design Systems', 'Webflow', 'Tilda',
  'Casino UX', 'Dashboard Design', 'Telegram Games', 'Web3 UX', 'Mobile Design',
  'Prototyping', 'Adobe CC', 'Wireframing', 'User Testing', 'Information Architecture',
];

export default function MarqueeBar() {
  const items = [...SKILLS, ...SKILLS];
  return (
    <div className="border-y-2 border-[#0a0a0a] bg-[#0a0a0a] text-white overflow-hidden py-3">
      <div className="marquee-inner">
        {items.map((skill, i) => (
          <span key={i} className="font-mono text-xs uppercase tracking-widest mx-6">
            {skill}
            <span className="ml-6 opacity-40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
