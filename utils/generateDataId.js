const mongoose = require('mongoose');

const generateDataId = async () => {
    const UserData = mongoose.model('UserData'); // Lấy model đã đăng ký
    const getRandomNumber = () => Math.floor(Math.random() * 99999) + 1;
    const getRandomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z

    let dataId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10; // Giới hạn số lần thử

    while (!isUnique && attempts < maxAttempts) {
        const numberPart = getRandomNumber();
        const letterPart = getRandomLetter();
        dataId = `${numberPart}${letterPart}`; // Ví dụ: 432C, 61532X

        try {
            const existingUser = await UserData.findOne({ dataId });
            if (!existingUser) {
                isUnique = true;
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra dataId:', error);
            throw new Error('Không thể kiểm tra tính duy nhất của dataId');
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Không thể tạo dataId duy nhất sau nhiều lần thử');
    }

    return dataId;
};

module.exports = generateDataId;