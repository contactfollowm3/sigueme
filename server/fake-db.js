const Tmer = require('./models/tmer');
const User = require('./models/user'); 
const Booking = require('./models/booking');

const fakeDbData = require('./data.json');

class FakeDb {
  constructor() {
    this.tmers = fakeDbData.tmers;
    this.users = fakeDbData.tmers;

  }

  async cleanDb() {
    //with away, the rest of the code won't be executed until we finsih to delete the database
    await User.removeAllListeners({});
    await Tmer.deleteMany({});
    await Booking.removeAllListeners({});
  }

  pushDataToDb() {
    const user = new User(fakeDbData.users[0]);
    const user2 = new User(fakeDbData.users[1]);

    this.tmers.forEach((tmer) => {
      //the Tmer(tmer) model is defined in model/tmer.js this is the name we gave to the scheme.
      /* In summary, the pushTmersToDb() function loops through the
      this.tmers array,creates a new instance of the Tmer model for
      each object, and saves each instance to the MongoDB database. */
      const newTmer = new Tmer(tmer);
      newTmer.user = user;
      user.tmers.push(newTmer);
      newTmer.save();
    });
    user.save();
    user2.save();
  }

  async seedDb() {
    await this.cleanDb();
    await this.pushDataToDb();
  }

}

module.exports = FakeDb;


