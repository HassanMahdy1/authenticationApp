import jwt from 'jsonwebtoken'

export const accessToken = (id) => {
  return jwt.sign(
    {
      currentUser: {
        id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "5m" }
  );
};

export const refreshToken = (id) => {
  return jwt.sign(
    {
      currentUser: {
        id,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: `${process.env.REFRESH_TOKEN_EXP}d` }
  );
};
