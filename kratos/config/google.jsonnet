local claims = std.extVar("claims");

{
  identity: {
    traits: {
      // Directly use the email claim
      email: claims.email,
      
      // Correct format for name concatenation
      name: if std.objectHas(claims, "given_name") && std.objectHas(claims, "family_name") then
        claims.given_name + " " + claims.family_name
      else if std.objectHas(claims, "name") then
        claims.name
      else
        "No name provided",
    },
  },
}