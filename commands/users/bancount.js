const { SlashCommandBuilder } = require("discord.js");
const { getConnection } = require("../../utils/databaseUtils"); // Assurez-vous que le chemin est correct

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bancount")
    .setDescription(
      "Affiche le nombre de bannissements dans la base de données."
    ),
  async execute(interaction) {
    try {
      const dbConnection = await getConnection();
      const [rows] = await dbConnection.execute(
        "SELECT COUNT(*) AS count FROM banned_users"
      );
      await dbConnection.end();

      await interaction.reply(
        `Nombre de bannissements dans la base de données : ${rows[0].count}`
      );
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de bannissements :",
        error
      );
      await interaction.reply(
        "Une erreur s'est produite lors de la récupération du nombre de bannissements."
      );
    }
  },
};
