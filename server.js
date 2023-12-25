const app = require("./app");
const dotenv = require("dotenv");
const { dbConnect } = require("./config/db");


// handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shut Down the server due to Unhandled Promise Rejection`);
  process.exit(1);
});

//config
dotenv.config({ path: "config/config.env" });

//config db connect
dbConnect();

// start the server
const server = app.listen(process.env.PORT, () =>
{  console.log(`server start ${process.env.PORT}`)
  
}
);

// Unhandeld Promise Rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error:${err.message}`);
  console.log(`Shut Down the server due to Unhandeld Promise Rejection`);
  server.close(() => {
    process.exit(1);
  });
});
