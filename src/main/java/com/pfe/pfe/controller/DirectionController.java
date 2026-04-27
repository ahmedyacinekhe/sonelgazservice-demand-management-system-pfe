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

import com.pfe.pfe.entity.Direction;
import com.pfe.pfe.service.DirectionService;

@RestController
@RequestMapping("/Api/directions")
public class DirectionController {
    @Autowired
    private DirectionService directionService;

    @GetMapping
    public List<Direction> findAll(){
        return directionService.findAll();
    }
    @GetMapping("/{id}")
    public Direction findById(@PathVariable int id){
        return directionService.findById(id);
    }
    @PostMapping
    public Direction save(@RequestBody Direction direction){
        return directionService.save(direction);
    }
    @PutMapping("/{id}")
    public Direction update(@PathVariable int id,@RequestBody Direction direction){
        return directionService.save(direction);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        directionService.deleteById(id);
    }
    
}
