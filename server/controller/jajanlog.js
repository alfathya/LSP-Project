const JajanlogModel = require('../model/jajanlog');

class JajanlogController {
    static async create (req, res, next) {
        try {
            const payload = req.body
            const userId = req.user.id

            const createRecord = await JajanlogModel.create(payload, userId)

            res.status(201).json(createRecord)
        } catch (error) {
            next(error)
        }
    }

    static async update (req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const payload = req.body
            const userId = req.user.id;

            const updateRecord = await JajanlogModel.update(id, payload, userId)

            res.status(200).json(updateRecord)
        } catch (error) {
            next(error)
        }
    }

    static async getAll (req, res, next) {
        try {
            const userId = req.user.id;
            const getAllRecords = await JajanlogModel.getAll(userId)

            res.status(200).json(getAllRecords)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = JajanlogController;