import { MulterError } from "multer";

function error(message: string, name: string) {
  const err = new Error();
  err.message = message;
  err.name = name;
  throw err;
}

function multerErrors(err: MulterError | Error): string {
  let errorMessage: string;
  if (err instanceof MulterError) {
    errorMessage = "A Multer error occurred when saving to local folder.";
  } else if (err instanceof Error) {
    errorMessage = "An unknown error occurred when saving to local folder.";
  }
  return errorMessage!;
}

export { error, multerErrors };
