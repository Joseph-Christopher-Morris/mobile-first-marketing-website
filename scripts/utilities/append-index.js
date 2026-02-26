function handler(event) {
  var r = event.request;
  if (r.uri.endsWith('/')) r.uri += 'index.html';
  else if (!r.uri.includes('.')) r.uri += '/index.html';
  return r;
}
