output "web_public_ip" {
  description = "Public floating IP address assigned to the web server."
  value       = openstack_networking_floatingip_v2.web.address
}

output "web_url" {
  description = "Full HTTP URL of the web server page."
  value       = "http://${openstack_networking_floatingip_v2.web.address}"
}
