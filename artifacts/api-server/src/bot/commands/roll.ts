import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("roll")
  .setDescription("Roll a dice")
  .addIntegerOption((opt) =>
    opt
      .setName("sides")
      .setDescription("Number of sides on the dice (default: 6)")
      .setMinValue(2)
      .setMaxValue(1000)
      .setRequired(false),
  )
  .addIntegerOption((opt) =>
    opt
      .setName("count")
      .setDescription("Number of dice to roll (default: 1)")
      .setMinValue(1)
      .setMaxValue(20)
      .setRequired(false),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const sides = interaction.options.getInteger("sides") ?? 6;
  const count = interaction.options.getInteger("count") ?? 1;

  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  const total = rolls.reduce((a, b) => a + b, 0);
  const rollStr = rolls.join(", ");

  if (count === 1) {
    await interaction.reply(`🎲 Rolled a d${sides}: **${total}**`);
  } else {
    await interaction.reply(
      `🎲 Rolled ${count}d${sides}: [${rollStr}] → Total: **${total}**`,
    );
  }
}
