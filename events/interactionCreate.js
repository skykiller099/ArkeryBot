const { getConnection } = require("../utils/databaseUtils");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isCommand()) {
      await handleCommandInteraction(interaction, client);
    } else if (interaction.isStringSelectMenu()) {
      await handleStringSelectMenuInteraction(interaction);
    }
  },
};

async function handleCommandInteraction(interaction, client) {
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return interaction.reply({
      embeds: [createEmbed("error", { description: "Commande inconnue." })],
      flags: [MessageFlags.Ephemeral],
    });
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error("Erreur lors de l'exécution de la commande:", error);
    return interaction.reply({
      embeds: [
        createEmbed("error", {
          description:
            "Une erreur s'est produite lors de l'exécution de cette commande.",
          errorCode: error.code || "UNKNOWN_ERROR",
          errorMessage: error.message || "Aucun message d'erreur disponible.",
        }),
      ],
      flags: [MessageFlags.Ephemeral],
    });
  }
}

async function handleStringSelectMenuInteraction(interaction) {
  const dbConnection = await getConnection();

  try {
    const customId = interaction.customId;

    if (customId.startsWith("add_staff_")) {
      await handleAddStaffInteraction(interaction, dbConnection);
    } else if (customId.startsWith("update_staff_")) {
      await handleUpdateStaffInteraction(interaction, dbConnection);
    } else {
      return interaction.update({
        embeds: [
          createEmbed("error", { description: "Interaction menu inconnue." }),
        ],
        components: [],
      });
    }
  } catch (error) {
    console.error("Erreur lors du traitement de l'interaction menu:", error);
    return interaction.update({
      embeds: [
        createEmbed("error", {
          description:
            "Une erreur est survenue lors du traitement de votre sélection.",
          errorCode: error.code || "UNKNOWN_ERROR",
          errorMessage: error.message || "Aucun message d'erreur disponible.",
        }),
      ],
      components: [],
    });
  } finally {
    if (dbConnection && dbConnection.end) {
      await dbConnection.end();
    }
  }
}

async function handleAddStaffInteraction(interaction, dbConnection) {
  const userId = interaction.customId.replace("add_staff_", "");
  const permissionLevel = interaction.values[0];

  try {
    await dbConnection.execute(
      "INSERT INTO staff_permissions (user_id, permission_level) VALUES (?, ?) ON DUPLICATE KEY UPDATE permission_level = ?",
      [userId, permissionLevel, permissionLevel]
    );

    return interaction.update({
      embeds: [
        createEmbed("success", {
          description: `✅ L'utilisateur <@${userId}> a été ajouté au staff avec le niveau de permission ${permissionLevel}.`,
        }),
      ],
      components: [],
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du staff:", error);
    return interaction.update({
      embeds: [
        createEmbed("error", {
          description: "Une erreur est survenue lors de l'ajout du staff.",
          errorCode: error.code || "UNKNOWN_ERROR",
          errorMessage: error.message || "Aucun message d'erreur disponible.",
        }),
      ],
      components: [],
    });
  }
}

async function handleUpdateStaffInteraction(interaction, dbConnection) {
  const userId = interaction.customId.replace("update_staff_", "");
  const permissionLevel = interaction.values[0];

  try {
    await dbConnection.execute(
      "UPDATE staff_permissions SET permission_level = ? WHERE user_id = ?",
      [permissionLevel, userId]
    );

    return interaction.update({
      embeds: [
        createEmbed("success", {
          description: `✅ Le niveau de permission de l'utilisateur <@${userId}> a été mis à jour au niveau ${permissionLevel}.`,
        }),
      ],
      components: [],
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du staff:", error);
    return interaction.update({
      embeds: [
        createEmbed("error", {
          description:
            "Une erreur est survenue lors de la mise à jour du staff.",
          errorCode: error.code || "UNKNOWN_ERROR",
          errorMessage: error.message || "Aucun message d'erreur disponible.",
        }),
      ],
      components: [],
    });
  }
}

function createEmbed(type, data = {}) {
  try {
    const embedsConfig = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, "../../config/embeds.json"),
        "utf8"
      )
    );
    const config = embedsConfig[type] || embedsConfig.default;
    const embed = new EmbedBuilder().setColor(config.color);

    if (config.title) embed.setTitle(config.title);
    if (config.description)
      embed.setDescription(replacePlaceholders(config.description, data));
    if (config.fields)
      embed.addFields(
        config.fields.map((field) => ({
          name: field.name,
          value: replacePlaceholders(field.value, data),
        }))
      );
    if (config.footer)
      embed.setFooter({
        text: config.footer.text,
        iconURL: config.footer.iconURL,
      });
    if (config.thumbnail) embed.setThumbnail(config.thumbnail);
    if (config.timestamp && (type === "success" || type === "error"))
      embed.setTimestamp();

    return embed;
  } catch (error) {
    console.error("Erreur lors de la création de l'embed:", error);
    return new EmbedBuilder()
      .setColor("#E74C3C")
      .setDescription(
        "Une erreur est survenue lors de la création de l'embed."
      );
  }
}

function replacePlaceholders(text, data) {
  for (const key in data) {
    text = text.replace(new RegExp(`{{${key}}}`, "g"), data[key]);
  }
  return text;
}
