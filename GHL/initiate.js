import dotenv from "dotenv";
// Configuring the environment variables
dotenv.config();

export const initiate = async (req, res) => {
  const options = {
    requestType: "code",
    redirectUri: "http://localhost:8000/oauth/callback",
    scopes: ["contacts.readonly", "conversations/message.write", "users.readonly", "locations.readonly"],
  };

  return res.redirect(
    `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=${
      options.requestType
    }&redirect_uri=${options.redirectUri}&client_id=${
      process.env.GHL_CLIENT_ID
    }&scope=${options.scopes.join(" ")}`
  );
};
