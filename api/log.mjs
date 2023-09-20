export default async function handler(request, response) {
  console.log(request.body);
  response.status(200).send('ok');
}
