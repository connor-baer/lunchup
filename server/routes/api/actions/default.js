import { sendResponse } from '../../../services/interactions';

export function handleDefault(teamId, responseUrl) {
  return sendResponse(responseUrl, {
    response_type: 'ephermal',
    text: "🚫 This action hasn't been configured yet",
    replace_original: false
  });
}
