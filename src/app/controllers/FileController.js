import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    const { id } = file;

    return res.json({ id, name, path });
  }
}

export default new FileController();
