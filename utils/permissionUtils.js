/**
 * Utilitaire de gestion des permissions pour le panel de permissions
 */

function getPermissionsByLevel(levelNumber) {
  const permissions = [];

  if (levelNumber >= 1) {
    // Modérateur
    permissions.push(
      {
        label: "Gérer les messages",
        value: "ManageMessages",
        description:
          "Donne la permission de supprimer et modifier les messages.",
      },
      {
        label: "Muter les membres",
        value: "MuteMembers",
        description:
          "Donne la permission de restreindre la parole des membres.",
      },
      {
        label: "Déplacer les membres",
        value: "MoveMembers",
        description:
          "Donne la permission de déplacer les membres entre les salons vocaux.",
      }
    );
  }

  if (levelNumber >= 2) {
    // Administrateur
    permissions.push(
      {
        label: "Gérer les rôles",
        value: "ManageRoles",
        description:
          "Donne la permission de créer, modifier et supprimer les rôles.",
      },
      {
        label: "Gérer les salons",
        value: "ManageChannels",
        description:
          "Donne la permission de créer, modifier et supprimer les salons.",
      },
      {
        label: "Gérer les pseudos",
        value: "ManageNicknames",
        description: "Donne la permission de modifier les pseudos des membres.",
      },
      {
        label: "Kick les membres",
        value: "KickMembers",
        description: "Donne la permission d'expulser les membres du serveur.",
      }
    );
  }

  if (levelNumber >= 3) {
    // Co-développeur
    permissions.push(
      {
        label: "Bannir les membres",
        value: "BanMembers",
        description:
          "Donne la permission de bannir définitivement les membres du serveur.",
      },
      {
        label: "Gérer les emojis et stickers",
        value: "ManageEmojisAndStickers",
        description:
          "Donne la permission de gérer les emojis et stickers du serveur.",
      },
      {
        label: "Gérer les webhooks",
        value: "ManageWebhooks",
        description:
          "Donne la permission de créer, modifier et supprimer les webhooks.",
      },
      {
        label: "Gérer les événements",
        value: "ManageEvents",
        description:
          "Donne la permission de créer, modifier et supprimer les événements du serveur.",
      }
    );
  }

  if (levelNumber >= 4) {
    // Développeur
    permissions.push({
      label: "Administrateur",
      value: "Administrator",
      description: "Donne toutes les permissions d'administration du serveur.",
    });
  }

  return permissions;
}

module.exports = {
  getPermissionsByLevel,
};
