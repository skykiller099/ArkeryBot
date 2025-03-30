const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Affiche la liste des commandes disponibles."),
  async execute(interaction, client) {
    const commandFolders = fs.readdirSync(path.join(__dirname, ".."));
    const commandsByCategory = {};

    // Ordre des catégories souhaité
    const categoryOrder = ["users", "staffserveurs", "staffbot"];

    // Remplissage de commandsByCategory
    for (const folder of commandFolders) {
      if (
        folder === "help.js" ||
        !fs.statSync(path.join(__dirname, "..", folder)).isDirectory()
      )
        continue;

      const commandFiles = fs
        .readdirSync(path.join(__dirname, "..", folder))
        .filter((file) => file.endsWith(".js"));

      const categoryCommands = [];
      for (const file of commandFiles) {
        const command = require(path.join(__dirname, "..", folder, file));
        categoryCommands.push(command.data.name);
      }

      let categoryDescription = "";
      switch (folder) {
        case "staffbot":
          categoryDescription =
            "Seuls les staffs du bot peuvent utiliser ces commandes !";
          break;
        case "staffserveurs":
          categoryDescription =
            "Seuls l'owner ou les administrateurs de ce serveur peuvent utiliser ces commandes !";
          break;
        case "users":
          categoryDescription = "Tout le monde peut utiliser ces commandes !";
          break;
        default:
          categoryDescription = "Commandes diverses.";
          break;
      }

      commandsByCategory[folder] = {
        description: categoryDescription,
        commands: categoryCommands,
      };
    }

    let currentPage = 0;
    const categories = categoryOrder.filter((cat) => commandsByCategory[cat]); // Utiliser l'ordre défini

    async function generateEmbed(page) {
      const category = categories[page];
      const categoryData = commandsByCategory[category];

      const embed = new EmbedBuilder()
        .setTitle(`Commandes - ${category}`)
        .setDescription(categoryData.description)
        .addFields({
          name: "Commandes",
          value:
            categoryData.commands.map((cmd) => `\`/${cmd}\``).join("\n") ||
            "Aucune commande",
        })
        .setFooter({ text: `Page ${page + 1}/${categories.length}` })
        .setTimestamp()
        .setThumbnail(
          "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940"
        );

      return embed;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("Précédent")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Suivant")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === categories.length - 1)
    );

    const message = await interaction.reply({
      embeds: [await generateEmbed(currentPage)],
      components: [row],
    });

    const collector = message.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "Vous ne pouvez pas utiliser ces boutons.",
          ephemeral: true,
        });
      }

      if (i.customId === "prev" && currentPage > 0) {
        currentPage--;
      } else if (i.customId === "next" && currentPage < categories.length - 1) {
        currentPage++;
      }

      row.components[0].setDisabled(currentPage === 0);
      row.components[1].setDisabled(currentPage === categories.length - 1);

      await i.update({
        embeds: [await generateEmbed(currentPage)],
        components: [row],
      });
    });

    collector.on("end", () => {
      interaction.editReply({ components: [] });
    });
  },
};
