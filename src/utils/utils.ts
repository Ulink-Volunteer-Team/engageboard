export const OnLocalHost = () => location.href.split(":")[1].slice(2) === "localhost";

export const UsingHTTPS = () => location.protocol.split(":").shift() === "https";
