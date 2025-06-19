const mongoose = require('mongoose');

const generateDataId = async () => {
    const UserData = mongoose.model('UserData'); // Get registered model
    const getRandomNumber = () => Math.floor(Math.random() * 99999) + 1;
    const getRandomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z

    let dataId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10; // Limit number of attempts

    while (!isUnique && attempts < maxAttempts) {
        const numberPart = getRandomNumber();
        const letterPart = getRandomLetter();
        dataId = `${numberPart}${letterPart}`; // Example: 432C, 61532X

        try {
            const existingUser = await UserData.findOne({ dataId });
            if (!existingUser) {
                isUnique = true;
            }
        } catch (error) {
            console.error('Error checking dataId:', error);
            throw new Error('Unable to check dataId uniqueness');
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Unable to generate unique dataId after multiple attempts');
    }

    return dataId;
};

module.exports = generateDataId;