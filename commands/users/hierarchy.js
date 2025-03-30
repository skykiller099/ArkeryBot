const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { PERMISSION_LEVELS } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hierarchy")
    .setDescription("Affiche la hiérarchie des permissions du staff du bot."),
  async execute(interaction) {
    const hierarchy = Object.entries(PERMISSION_LEVELS)
      .sort(([, a], [, b]) => b - a)
      .map(([name, level]) => `**${name}**: Niveau ${level}`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("#3498DB") // Bleu pour les informations
      .setTitle("Hiérarchie des permissions")
      .setDescription(hierarchy)
      .setThumbnail(
        "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940"
      )
      .setFooter({
        text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
        iconURL:
          "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
      });

    await interaction.reply({ embeds: [embed] });
  },
};
