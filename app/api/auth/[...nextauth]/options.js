import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthClient } from "../../../lib/enums";

export const options = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      secret: process.env.NEXT_AUTH_SECRET,
      debug: process.env.NODE_ENV === "development",
      session: {
        strategy: "jwt",
      },
      pages: {
        signIn: "/auth/login",
        error: "/login",
        signOut: "auth/logout",
      },
      async authorize(credentials) {
        const { email, password } = credentials;
        if (!email || !password) {
          throw new Error("Email and password are required!");
        }
        try {
          const res = await login({
            email,
            password,
            authClient: AuthClient.CREDENTIALS,
          });
          const user = await res.json();

          if (res.ok && user) {
            return user;
          } else {
            return null;
          }
        } catch {
          throw new Error("Oops, something went wrong!");
        }
      },
    }),
    GitHubProvider({
      id: "github",
      name: "github",
      async profile(profile) {
        // call the login api here -> if user exists, return user, else create user and return user
        try {
          const res = await fetch(`${process.env.API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: profile.email,
              authClient: AuthClient.GITHUB,
            }),
          });
          const user = await res.json();
          if (res.ok && user) {
            return {
              ...user,
              id: profile.id,
            };
          } else {
            throw new Error("GITHUB LOGIN ERROR TRYING TO REGISTER!");
          }
        } catch (e) {
          // register user
          const res = await fetch(`${process.env.API_URL}/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: profile.email,
              authClient: AuthClient.GITHUB,
              avatar: profile.avatar_url,
            }),
          });

          const user = await res.json();

          if (res.ok && user) {
            return {
              ...user,
              id: profile.id,
            };
          } else {
            throw new Error("GITHUB REGISTRATION ERROR!");
          }
        }
      },
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      id: "google",
      name: "google",
      async profile(profile) {
        try {
          const res = await fetch(`${process.env.API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: profile.email,
              authClient: AuthClient.GOOGLE,
            }),
          });
          const user = await res.json();
          if (res.ok && user) {
            return {
              ...user,
              id: profile.sub,
            };
          } else {
            throw new Error("GOOGLE LOGIN ERROR TRYING TO REGISTER!");
          }
        } catch (e) {
          // register user
          const res = await fetch(`${process.env.API_URL}/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: profile.email,
              authClient: AuthClient.GOOGLE,
              avatar: profile.picture,
              firstName: profile.given_name,
              lastName: profile.family_name,
            }),
          });

          const user = await res.json();

          if (res.ok && user) {
            return {
              ...user,
              id: profile.sub,
            };
          } else {
            throw new Error("GOOGLE REGISTRATION ERROR!");
          }
        }
      },
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    // async signIn(user, account, profile) {
    //   console.log("SignIn: ", user, account, profile);
    //   return true;
    // },
    // async redirect(url, baseUrl) {
    //   console.log("Redirect: ", url, baseUrl);
    //   return baseUrl;
    // },
    async session(session, user) {
      return session;
    },
    async jwt({ user }) {
      return user;
    },
  },
};
