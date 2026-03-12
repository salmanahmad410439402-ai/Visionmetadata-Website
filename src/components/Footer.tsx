const Footer = () => {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} VisionMeta PRO • All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;