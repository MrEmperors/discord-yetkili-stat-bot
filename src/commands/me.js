const moment = require("moment");
require("moment-duration-format");
const conf = require("../configs/config.json");
const messageUserChannel = require("../schemas/messageUserChannel");
const voiceUserChannel = require("../schemas/voiceUserChannel");
const messageUser = require("../schemas/messageUser");
const voiceUser = require("../schemas/voiceUser");
const voiceUserParent = require("../schemas/voiceUserParent");
const coin = require("../schemas/coin");
const taggeds = require("../schemas/taggeds");

module.exports = {
  conf: {
    aliases: [],
    name: "me",
    help: "me"
  },

  run: async (client, message, args, embed) => {
    const category = async (parentsArray) => {
      const data = await voiceUserParent.find({ guildID: message.guild.id, userID: message.author.id });
      const voiceUserParentData = data.filter((x) => parentsArray.includes(x.parentID));
      let voiceStat = 0;
      for (var i = 0; i <= voiceUserParentData.length; i++) {
        voiceStat += voiceUserParentData[i] ? voiceUserParentData[i].parentData : 0;
      }
      return moment.duration(voiceStat).format("H [saat], m [dakika] s [saniye]");
    };
    

    const coinData = await coin.findOne({ guildID: message.guild.id, userID: message.author.id });


    const maxValue = client.ranks[client.ranks.indexOf(client.ranks.find(x => x.coin >= (coinData ? coinData.coin : 0)))] || client.ranks[client.ranks.length-1];
    const taggedData = await taggeds.findOne({ guildID: message.guild.id, userID: message.author.id });

    const coinStatus = conf.staffs.some(x => message.member.roles.cache.has(x)) ? `**➥ Puan Durumu:** ${taggedData ? `\nTag aldırdığı üye sayısı: \`${taggedData.taggeds.length}\`` : ""}
    - Puanınız: \`${coinData ? coinData.coin : 0}\`, Gereken: \`${maxValue.coin}\` 
    ${progressBar(coinData ? coinData.coin : 0, maxValue.coin, 8)} \`${coinData ? coinData.coin : 0} / ${maxValue.coin}\`
    ${client.ranks[client.ranks.indexOf(maxValue)-1] ? `**───────────────** 
    **➥ Yetki Durumu:** 
    ${maxValue !== client.ranks[client.ranks.length-1] ? `Şu an <@&${client.ranks[client.ranks.indexOf(maxValue)-1].role}> rolündesiniz. <@&${maxValue.role}> rolüne ulaşmak için \`${maxValue.coin-coinData.coin}\` coin daha kazanmanız gerekiyor!` : "Şu an son yetkidesiniz! Emekleriniz için teşekkür ederiz."}` : `**───────────────** 
    **➥ Yetki Durumu:** 
    <@&${maxValue.role}> rolüne ulaşmak için \`${maxValue.coin - (coinData ? coinData.coin : 0)}\` coin daha kazanmanız gerekiyor!
    `}` : "";

    embed.setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 }))
    embed.setDescription(`
    ${message.author.toString()} (${message.member.roles.highest}) kişisinin sunucu verileri
    **───────────────**
    ${coinStatus} 
    `)
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