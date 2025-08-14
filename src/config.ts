const config = {
  appName: "Clientela Pro",
  appDescription:
    "Clientela Pro is a platform for businesses to manage their customer relationships and interactions effectively.",
  domainName:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://quillminds.com",
};

export default config;
