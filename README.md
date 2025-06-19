# Changes [Info: (c) means change, (i) means improvement]
1. (c) Bot files are now in US-EN but all commands have comments available in VI and translated strings as comments
2. (i) Changed command file names to be more readable (assignall => assignAll)
3. (i) Changed out the deprecated ``.setDMPermission(false)`` with ``.setContexts([InteractionContextType.Guild])`` where it appeared

# Environment Setup

This project requires several environment variables to function properly. Follow this guide to set up your `.env` file.

## Required Environment Variables

Create a `.env` file in your project root directory with the following variables:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_application_id
GUILD_ID=your_discord_server_id

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/your_database_name
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Discord Channel IDs
WELCOME_ID=channel_id_for_welcome_messages
LEAVE_ID=channel_id_for_leave_messages
```

## How to Obtain These Values

### Discord Bot Setup

1. **DISCORD_TOKEN**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your application (or create a new one)
   - Navigate to the "Bot" section
   - Click "Reset Token" and copy the new token
   - **⚠️ Keep this token secret and never share it publicly**

2. **CLIENT_ID**
   - In the Discord Developer Portal
   - Go to "General Information" section
   - Copy the "Application ID"

3. **GUILD_ID**
   - Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
   - Right-click on your Discord server
   - Select "Copy Server ID"

### MongoDB Configuration

4. **MONGO_URI**
   - **Local MongoDB**: `mongodb://localhost:27017/your_database_name`
   - **MongoDB Atlas**: 
     - Go to your MongoDB Atlas dashboard
     - Click "Connect" on your cluster
     - Choose "Connect your application"
     - Copy the connection string and replace `<password>` with your actual password

### Discord Channel Configuration

5. **WELCOME_ID**
   - Right-click on the channel where you want welcome messages sent
   - Select "Copy Channel ID"

6. **LEAVE_ID**
   - Right-click on the channel where you want leave messages sent
   - Select "Copy Channel ID"

## Example Configuration

```env
DISCORD_TOKEN=someCoolToken
CLIENT_ID=123456789
GUILD_ID=987654321
MONGO_URI=mongodb://localhost:27017/discord_bot_db
WELCOME_ID=111111111111111111
LEAVE_ID=222222222222222222
```

## Security Notes

- **Never commit your `.env` file to version control**
- Add `.env` to your `.gitignore` file
- Use `.env.example` (without actual values) as a template for other developers
- Regenerate tokens if they are accidentally exposed

## Bot Permissions Required

Ensure your Discord bot has the following permissions in your server:

- `Send Messages`
- `Use Slash Commands`
- `View Channels`
- `Manage Guild` (for member management commands)
- `Read Message History`

## Installation Steps

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Fill in all the required values in `.env`
5. Ensure MongoDB is running (if using local installation)
6. Run `npm start`

## Troubleshooting

### Common Issues

- **Bot not responding**: Check if `DISCORD_TOKEN` is correct and the bot is invited to your server
- **Database connection failed**: Verify `MONGO_URI` is correct and MongoDB is running
- **Commands not appearing**: Ensure `CLIENT_ID` and `GUILD_ID` are correct
- **Missing permissions**: Check bot permissions in Discord server settings

### Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure the bot has proper permissions in your Discord server