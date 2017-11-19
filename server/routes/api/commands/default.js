import { sendResponse } from '../../../services/interactions';

export function handleDefault(teamId, responseUrl) {
  return sendResponse(responseUrl, {
    response_type: 'in_channel',
    text: "🚫 This command hasn't been configured."
  });
}
