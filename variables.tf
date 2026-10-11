variable "project_network" {
  description = "Exact name of the existing CSC cPouta project network."
  type        = string
}

variable "name_prefix" {
  description = "Short prefix used to name the resources created for this web server."
  type        = string
  default     = "week7-web"
}

variable "ssh_public_key_path" {
  description = "Path to your SSH public key file. Only the public key is uploaded to OpenStack."
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "ssh_allowed_cidr" {
  description = "IPv4 CIDR range allowed to connect to SSH. Use your own public IP with /32."
  type        = string

  validation {
    condition     = can(cidrhost(var.ssh_allowed_cidr, 0)) && var.ssh_allowed_cidr != "0.0.0.0/0"
    error_message = "ssh_allowed_cidr must be a valid CIDR and must not allow SSH from the whole internet (0.0.0.0/0)."
  }
}

variable "image_name" {
  description = "Name of the Linux image available in the cPouta project."
  type        = string
  default     = "Ubuntu-22.04"
}

variable "flavor_name" {
  description = "Name of the cPouta flavor to use for the virtual machine."
  type        = string
  default     = "standard.small"
}

variable "student_name" {
  description = "Name to display on the web page."
  type        = string
}

variable "page_message" {
  description = "Short message to display below the student name on the web page."
  type        = string
  default     = "This page was deployed automatically with OpenTofu and cloud-init."
}
