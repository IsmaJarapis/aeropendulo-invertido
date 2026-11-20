const { useEffect } = React;

const App = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Nav />
      <HeroSection />
      <OverviewSection />
      <SpecsSection />
      <ElectronicsSection />
      <ModelSection />
      <SimulatorSection />
      <TrainingSection />
      <SoftwareSection />
      <ResultsSection />
      <MediaSection />
      <DocsSection />
      <TeamSection />
      <FooterSection />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
