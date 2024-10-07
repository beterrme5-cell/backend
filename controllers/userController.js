import userModel from "../models/userModel";

export const createUser = async (req, res) => {
    try {

        const { accountId } = req.body;
        const user = await userModel.create({ accountId });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}