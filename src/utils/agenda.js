const Agenda = require("agenda");
const Session = require("../models/Session");
const fs = require("fs");

const agenda = new Agenda({
  db: { address: process.env.DATABASE_URL },
  useUnifiedTopology: true,
});

/**
 * Deletes the session directory and its entries from MongoDB after the expiry time
 *
 * @param {String} sessionDir - session directory to delete
 * @param {String} sessionId  - session entry to delete from MongoDB
 */
agenda.define("delete session", async (job, done) => {
  const { sessionDir, sessionId } = job.attrs.data;

  // Deletes the file and the MongoDB entry after the expiry time
  fs.rm(sessionDir, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(err);
      done(err);
    }
    // Delete Session doc from MongoDB
    Session.deleteOne({ _id: sessionId })
      .then((result) => {
        console.log(`Session ${sessionId} deleted: ${result.deletedCount}`);
        done();
      })
      .catch((err) => {
        console.error(`Error deleting session entry: ${err}`);
        done(err);
      });
    done();
  });
});

module.exports = agenda;
