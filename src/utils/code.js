import stringEDfrom from "string-encode-decode";

export const encode = (data) => stringEDfrom.encode(data.toString());
export const decode = (hash) => stringEDfrom.decode(hash);
