import { CONNECTIONS } from '@/lib/constant';
import React from 'react';
import ConnectionCard from '@/components/global/connection-card';
import { currentUser } from '@clerk/nextjs/server';
import { onDiscordConnect } from './_actions/discord-connection';
import { onNotionConnect } from './_actions/notion-connection';
import { onSlackConnect } from './_actions/slack-connection';
import { getUserData } from './_actions/get-user';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConnectionTypes } from '@/lib/types';

type Props = {
  searchParams?: { [key: string]: string | undefined }
}

const Connections = async (props: Props) => {
  const {
    webhook_id,
    webhook_name,
    webhook_url,
    guild_id,
    guild_name,
    channel_id,
    access_token,
    workspace_name,
    workspace_icon,
    workspace_id,
    database_id,
    app_id,
    authed_user_id,
    authed_user_token,
    slack_access_token,
    bot_user_id,
    team_id,
    team_name,
  } = props.searchParams ?? {};

  const user = await currentUser();
  if (!user) return null;

  const onUserConnections = async () => {
    if (webhook_id && channel_id && webhook_name && webhook_url && guild_name && guild_id) {
      await onDiscordConnect(channel_id, webhook_id, webhook_name, webhook_url, user.id, guild_name, guild_id);
    }
    
    if (access_token && workspace_id && workspace_icon && workspace_name && database_id) {
      await onNotionConnect(access_token, workspace_id, workspace_icon, workspace_name, database_id, user.id);
    }
    
    if (app_id && authed_user_id && authed_user_token && slack_access_token && bot_user_id && team_id && team_name) {
      await onSlackConnect(app_id, authed_user_id, authed_user_token, slack_access_token, bot_user_id, team_id, team_name, user.id);
    }

    // Initialize all connection types as false
    const connections: Record<ConnectionTypes, boolean> = {
      Discord: false,
      Notion: false,
      Slack: false,
      GoogleDrive: false,
      ChatGPT: false,
      LinkedIn: false,
      Instagram: false,
      WhatsApp: false
    };

    // Update connections based on user data
    const user_info = await getUserData(user.id);
    user_info?.connections.forEach((connection) => {
      if (connection.type in connections) {
        connections[connection.type as ConnectionTypes] = true;
      }
    });

    // Set GoogleDrive to true as per your original code
    connections.GoogleDrive = true;

    return connections;
  };

  const connections = await onUserConnections();

  return (
    <div className="relative flex flex-col p-5">
      <div className="flex justify-between w-full items-center">
        <h1 className='text-2xl'>Connections</h1>
      </div>
      <ScrollArea className="relative flex flex-col h-[500px]">
        <section className="flex flex-col">
          {CONNECTIONS.map((connection) => (
            <ConnectionCard
              key={connection.title}
              connected={connections}
            />
          ))}
        </section>
      </ScrollArea>
    </div>
  );
}

export default Connections;