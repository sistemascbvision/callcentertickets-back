
--consultar roles y usuarios
SELECT ur.user_id as id_usuario, u.username as usuario,  ur.role_id as rol_id, r.name rol
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
LIMIT 25;

--consultar usarios y agencias
Select ua.user_id as id_usuario, u.username as usuario, ua.agency_id as id_agencia, a.name agencies
FROM users u 
JOIN user_agencies ua ON u.id = ua.user_id
JOIN agencies a ON ua.agency_id = a.id
