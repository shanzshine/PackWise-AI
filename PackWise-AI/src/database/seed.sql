insert into attachment_methods
(name,cost_per_gram,weight_per_cm,description)
values
('Plastic Strap',0.05,0.05,'Standard plastic strap'),
('Twist Tie',0.03,0.04,'Wire twist tie'),
('Plastic Clip',0.08,0.10,'Plastic locking clip'),
('Adhesive Point',0.02,0.01,'Adhesive support');

insert into attachment_rules
(min_score,max_score,attachment_type,attachment_quantity)
values
(0,30,'Plastic Strap',2),
(31,60,'Plastic Strap',3),
(61,100,'Plastic Strap + Plastic Clip',4);