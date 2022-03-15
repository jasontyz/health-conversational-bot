import discord

from DialogHandler.DialogHandler import dialog_handler
from covid import AUActiveCasesLocation, AUStats, Vaccine
from externalapi import googlemaps, newsapi, traveladvice
from recommendation import Food
from integration import PlainText

PlainText.setup_handler(dialog_handler)
follow_up_intents = ["cov19_checker"]

TOKEN = 'OTA4MjAzNzIzMDAyNjIxOTUz.YYyUoQ.iQqFb5N543fE48bv0TrNcROxy9w'
GUILD = 'HealthBotServer'


def start_discord_client():
    client = CustomClient()
    client.run(TOKEN)

class CustomClient(discord.Client):
    async def on_ready(self):
        guild = discord.utils.get(self.guilds, name=GUILD)
        
        print(
            f'{self.user} is connected to the following guild:\n'
            f'{guild.name} (id: {guild.id})'
        )

        members = '\n - '.join([member.name for member in guild.members])
        print(f'Guild members:\n - {members}')
    
    async def on_member_join(self, member):
        print(f'{member.name} joined the server!')
        
    async def on_message(self, message):
        if message.author == self.user:
            return message
        
        response = PlainText.process_msg(dialog_handler, message.content)
        await message.channel.send(response)


start_discord_client()