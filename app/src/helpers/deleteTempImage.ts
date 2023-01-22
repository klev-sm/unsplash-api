import * as fs from "fs";

function deleteTempImage(path: string): NodeJS.ErrnoException | undefined {
  fs.unlink(path, (err) => {
    if (err) return err;
  });
  return;
}

export { deleteTempImage };
