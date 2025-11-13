import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


function createSchema(modelName, schemaDefinition) {
    const schema = new mongoose.Schema(schemaDefinition);
    return mongoose.model(modelName, schema);
}


function createRow(model, rowData) {
    const row = new model(rowData);
    return row.save();
}

function uploadData(model, dataArray) {
    return model.insertMany(dataArray);
}

function getDatabaseConfig() {
    let MONGODB_URI = process.env.MONGODB_URI;
    return { MONGODB_URI };
}

export { createSchema, createRow, uploadData, getDatabaseConfig };