import dotenv from 'dotenv';
// import stringify from 'stringify-object';

// dotenv.config({ path: '../.env' });

dotenv.config({});

let PORT = process.env.PORT || 3000;
let MONGODB_URI = process.env.MONGODB_URI 

console.log('Test Environment Variables:');
console.log('PORT:', PORT);
console.log('MONGODB_URI:', MONGODB_URI);

// console.log('Test Environment Variables:');
// console.log(stringify({
//   PORT: PORT,
//   MONGODB_URI: MONGODB_URI
// }, { indent: '  ' }));

// export { PORT, MONGODB_URI };

// export const getTestEnv = () => {