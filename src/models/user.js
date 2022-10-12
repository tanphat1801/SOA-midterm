import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const User = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
});

export default model('User', User);