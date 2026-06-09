const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Users = require("../models/Users.model");
const generateTempUsername = require("../utils/usernameGenerator");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        let user = await Users.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await Users.create({
            email: profile.emails[0].value,
            username: generateTempUsername(),
            googleId: profile.id,
            isVerified: true
          });
        }

        return done(null, user);

      } catch (err) {
        return done(err, null);
      }
    }
  )
);