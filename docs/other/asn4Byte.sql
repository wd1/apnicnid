SELECT allocation_address, country, date
FROM ftp_stats
WHERE registrar = 'apnic'
	AND allocation_type = 'asn'
	AND CAST(allocation_address AS INT) >= 65535
	AND date >= 20090000
	AND date < 20100000
	AND (status = 'allocated' OR status = 'assigned')
GROUP BY allocation_address, country, date