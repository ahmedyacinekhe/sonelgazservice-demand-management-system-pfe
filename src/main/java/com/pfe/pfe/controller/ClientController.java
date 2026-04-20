package com.pfe.pfe.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pfe.pfe.entity.Client;
import com.pfe.pfe.service.ClientService;



@RestController
@RequestMapping("/Api/clients")
public class ClientController {
    @Autowired
    private ClientService clientService ;
    @GetMapping
    public List<Client> findAll(){
        return clientService.findAll();
    }
    @GetMapping("/{id}")
    public Client findById(@PathVariable int id){
        return  clientService.findById(id);
    }
    @PostMapping
    public Client  save(@RequestBody Client client){
        return clientService.save(client);
    }

    @PutMapping("/{id}")
    public Client update(@PathVariable int id,@RequestBody Client client){
        return clientService.save(client);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        clientService.deleteById(id);
    }
    
}
