const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} = require("discord.js");
const fs = require("fs").promises;
const path = require("path");
const { TOKEN, CLIENT_ID } = require("./config");
const { initializeDatabase } = require("./database");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

async function loadCommands(dir) {
  try {
    const files = await fs.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.lstat(filePath);

      if (stat.isDirectory()) {
        await loadCommands(filePath);
      } else if (file.endsWith(".js")) {
        try {
          const command = require(filePath);
          if (command && command.data && command.data.name) {
            client.commands.set(command.data.name, command);
          } else {
            console.error(
              `Le fichier ${file} n'a pas de propriété 'data' valide.`
            );
          }
        } catch (error) {
          console.error(
            `Erreur lors du chargement de la commande ${file}:`,
            error
          );
        }
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des commandes:", error);
  }
}

async function registerCommands() {
  const commands = client.commands.map(({ data }) => data.toJSON());
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    console.log("Enregistrement des commandes slash globales...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("Commandes slash globales enregistrées avec succès!");
  } catch (error) {
    console.error(
      "Erreur lors de l'enregistrement des commandes slash globales:",
      error
    );
  }
}

async function loadEvents() {
  try {
    const eventFiles = (await fs.readdir("./events")).filter((file) =>
      file.endsWith(".js")
    );

    for (const file of eventFiles) {
      try {
        const event = require(`./events/${file}`);
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
      } catch (error) {
        console.error(
          `Erreur lors du chargement de l'événement ${file}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des événements:", error);
  }
}

client.once("ready", async () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);

  await initializeDatabase();
  await loadCommands(path.join(__dirname, "commands"));
  await loadEvents();
  await registerCommands();
});

client.on("error", (error) => {
  console.error("Erreur du client Discord:", error);
});

client.on("warn", (warning) => {
  console.warn("Avertissement du client Discord:", warning);
});

client.on("reconnecting", () => {
  console.log("Reconnexion du client Discord...");
});

client.on("disconnect", () => {
  console.log("Client Discord déconnecté.");
});

client.login(TOKEN);
