import mongoose from "mongoose";
// FIXME neste file voce possui tanto schema quanto models, voce poderia dividir em arquivos diferentes para melhorar a organizacao.
const ImageSchema = new mongoose.Schema({
  link: String,
  publicID: String,
});

mongoose.set("strictQuery", false); // FIXME Isso aqui é necessario mesmo?
const ImageModel = mongoose.model("images", ImageSchema);
export { ImageModel };
