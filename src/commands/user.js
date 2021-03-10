const moment = require("moment");
require("moment-duration-format");
const conf = require("../configs/config.json");
const messageUserChannel = require("../schemas/messageUserChannel");
const voiceUserChannel = require("../schemas/voiceUserChannel");
const messageUser = require("../schemas/messageUser");
const voiceUser = require("../schemas/voiceUser");
const voiceUserParent = require("../schemas/voiceUserParent");
const coin = require("../schemas/coin");

module.exports = {
  conf: {
    aliases: ["kullanıcı"],
    name: "user",
    help: "user [kullanıcı]"
  },

  run: async (client, message, args, embed) => {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.channel.send(embed.setDescription("Bir kullanıcı belirtmelisin!"));

    const category = async (parentsArray) => {
      const data = await voiceUserParent.find({ guildID: message.guild.id, userID: member.user.id });
      const voiceUserParentData = data.filter((x) => parentsArray.includes(x.parentID));
      let voiceStat = 0;
      for (var i = 0; i <= voiceUserParentData.length; i++) {
        voiceStat += voiceUserParentData[i] ? voiceUserParentData[i].parentData : 0;
      }
      return moment.duration(voiceStat).format("H [saat], m [dakika]");
    };
    
    const Active1 = await messageUserChannel.find({ guildID: message.guild.id, userID: member.user.id }).sort({ channelData: -1 });
    const Active2 = await voiceUserChannel.find({ guildID: message.guild.id, userID: member.user.id }).sort({ channelData: -1 });
    const voiceLength = Active2 ? Active2.length : 0;
    let voiceTop;
    let messageTop;
    Active1.length > 0 ? messageTop = Active1.splice(0, 5).map(x => `<#${x.channelID}>: \`${Number(x.channelData).toLocaleString()} mesaj\``).join("\n") : messageTop = "Veri bulunmuyor."
    Active2.length > 0 ? voiceTop = Active2.splice(0, 5).map(x => `<#${x.channelID}>: \`${moment.duration(x.channelData).format("H [saat], m [dakika]")}\``).join("\n") : voiceTop = "Veri bulunmuyor."
    
    const messageData = await messageUser.findOne({ guildID: message.guild.id, userID: member.user.id });
    const voiceData = await voiceUser.findOne({ guildID: message.guild.id, userID: member.user.id });

    const messageDaily = messageData ? messageData.dailyStat : 0;
    const messageWeekly = messageData ? messageData.weeklyStat : 0;

    const voiceDaily = moment.duration(voiceData ? voiceData.dailyStat : 0).format("H [saat], m [dakika]");
    const voiceWeekly = moment.duration(voiceData ? voiceData.weeklyStat : 0).format("H [saat], m [dakika]");
    
    const coinData = await coin.findOne({ guildID: message.guild.id, userID: member.user.id });

    const filteredParents = message.guild.channels.cache.filter((x) =>
      x.type === "category" &&
      !conf.publicParents.includes(x.id) &&
      !conf.registerParents.includes(x.id) &&
      !conf.solvingParents.includes(x.id) &&
      !conf.privateParents.includes(x.id) &&
      !conf.aloneParents.includes(x.id) &&
      !conf.funParents.includes(x.id)
    );

    const maxValue = client.ranks[client.ranks.indexOf(client.ranks.find(x => x.coin >= (coinData ? coinData.coin : 0)))] || client.ranks[client.ranks.length-1];

    const coinStatus = conf.staffs.some(x => member.roles.cache.has(x)) ? ` **➥ Puan Durumu:**\n- Puanınız: \`${coinData ? coinData.coin : 0}\`, Gereken: \`${maxValue.coin}\` \n${progressBar(coinData ? coinData.coin : 0, maxValue.coin, 8)} \`${coinData ? coinData.coin : 0} / ${maxValue.coin}\`` : "";

    embed.setThumbnail(member.user.avatarURL({ dynamic: true, size: 2048 }))
    embed.setDescription(`
    ${member.user.toString()} (${member.roles.highest}) kişisinin sunucu verileri
    **───────────────**
    ${coinStatus}
    `)
    embed.addField("➥ Ses Verileri:", `
     \`•\` Haftalık Ses: \`${voiceWeekly}\`
     \`•\` Günlük Ses: \`${voiceDaily}\`
    `, true);
    embed.addField("➥ Mesaj Verileri:", `
    \`•\` Haftalık Mesaj: \`${Number(messageWeekly).toLocaleString()} mesaj\`
    \`•\` Günlük Mesaj: \`${Number(messageDaily).toLocaleString()} mesaj\`
    `, true);
    message.channel.send(embed);
  }
};

function progressBar(value, maxValue, size) {
const progress = Math.round(size * ((value / maxValue) > 1 ? 1 : (value / maxValue)));
const emptyProgress = size - progress > 0 ? size - progress : 0;

const progressText = "<a:fill:816043000407785522>".repeat(progress);
const emptyProgressText = "<:empty:816043000341725255>".repeat(emptyProgress);

return emptyProgress > 0 ? `<a:fill_start:816043000198463489>${progressText}${emptyProgressText}<:empty_end:816042999997268028>` : `<a:fill_start:816043000198463489>${progressText}${emptyProgressText}<a:fill_end:816043000386945064>`;
};